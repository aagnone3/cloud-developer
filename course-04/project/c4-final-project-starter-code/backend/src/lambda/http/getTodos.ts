import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import { getUserTodos } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('dataLayer')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event)
    logger.info(`User id parsed: ${userId}`)
    const todos = await getUserTodos(userId)
    logger.info(`Fetched ${todos.length} todos`, {
      data: todos
    })
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)