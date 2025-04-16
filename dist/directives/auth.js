import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from "graphql";
export const ROLES = ["UNKNOWN", "USER", "ADMIN"];
function authDirective(directiveName, getUserFn) {
    const typeDirectiveArgumentMaps = {};
    return {
        authDirectiveTypeDefs: `#graphql
    directive @${directiveName}(
      requires: Role = ADMIN,
    ) on OBJECT | FIELD_DEFINITION
 
    enum Role {
      ${ROLES.join('\n')}
    }`,
        authDirectiveTransformer: (schema) => mapSchema(schema, {
            [MapperKind.TYPE]: type => {
                const authDirective = getDirective(schema, type, directiveName)?.[0];
                if (authDirective) {
                    typeDirectiveArgumentMaps[type.name] = authDirective;
                }
                return undefined;
            },
            [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
                const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0] ??
                    typeDirectiveArgumentMaps[typeName];
                if (authDirective) {
                    const { requires } = authDirective;
                    if (requires) {
                        const { resolve = defaultFieldResolver } = fieldConfig;
                        fieldConfig.resolve = function (source, args, context, info) {
                            const user = getUserFn(context.user);
                            if (!user.hasRole(requires)) {
                                throw new Error('not authorized');
                            }
                            return resolve(source, args, context, info);
                        };
                        return fieldConfig;
                    }
                }
            }
        })
    };
}
function getUser(user) {
    const userRole = user ? user.role : "UNKNOWN";
    return {
        hasRole: (role) => {
            let tokenIndex = ROLES.indexOf(userRole);
            if (tokenIndex == -1)
                tokenIndex = 0;
            const roleIndex = ROLES.indexOf(role);
            return roleIndex >= 0 && tokenIndex >= roleIndex;
        }
    };
}
export const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth', getUser);
