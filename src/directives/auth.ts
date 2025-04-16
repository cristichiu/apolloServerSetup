import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from "graphql"
import { IUser } from "../interfaces/user.js"

export const ROLES: string[] = ["UNKNOWN", "USER", "ADMIN"]

function authDirective(
  directiveName: string,
  getUserFn: (user: IUser | null) => { hasRole: (role: string) => boolean }
) {
  const typeDirectiveArgumentMaps: Record<string, any> = {}
  return {
    authDirectiveTypeDefs: `#graphql
    directive @${directiveName}(
      requires: Role = ADMIN,
    ) on OBJECT | FIELD_DEFINITION
 
    enum Role {
      ${ROLES.join('\n')}
    }`,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          const authDirective = getDirective(schema, type, directiveName)?.[0]
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective
          }
          return undefined
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName]
          if (authDirective) {
            const { requires } = authDirective
            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig
              fieldConfig.resolve = function (source, args, context, info) {
                const user = getUserFn(context.user)
                if (!user.hasRole(requires)) {
                  throw new Error('not authorized')
                }
                return resolve(source, args, context, info)
              }
              return fieldConfig
            }
          }
        }
      })
  }
}
 
function getUser(user: IUser | null) {
  const userRole = user ? user.role : "UNKNOWN"
  return {
    hasRole: (role: string) => {
      let tokenIndex = ROLES.indexOf(userRole)
      if(tokenIndex == -1) tokenIndex = 0
      const roleIndex = ROLES.indexOf(role)
      return roleIndex >= 0 && tokenIndex >= roleIndex
    }
  }
}
 
export const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth', getUser)
