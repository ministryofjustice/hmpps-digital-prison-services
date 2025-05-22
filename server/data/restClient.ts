import { Readable } from 'stream'
import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'

import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'

interface GetRequest {
  path?: string
  query?: string
  headers?: Record<string, string>
  responseType?: string
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
  files?: Record<string, { buffer: Buffer; originalName: string }>
}

type PutRequest = PostRequest

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export function RestClientBuilder(name: string, config: ApiConfig) {
  return (token: string): RestClient => new RestClient(name, config, token)
}

export default class RestClient {
  agent: Agent

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: string,
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  async get<T>({ path = null, query = '', headers = {}, responseType = '' }: GetRequest): Promise<T> {
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post<T>({ path = null, headers = {}, responseType = '', data = {} }: PostRequest = {}): Promise<T> {
    try {
      const result = await superagent
        .post(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
  }

  async postMultipart<T>({
    path = null,
    headers = {},
    responseType = '',
    files = null,
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<T> {
    const endpoint = `${this.apiUrl()}${path}`
    const request = superagent
      .post(endpoint)
      .type('form')
      .agent(this.agent)
      .auth(this.token, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.timeoutConfig())
      .retry(2, (err, res) => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })

    Object.entries(data).forEach(([key, value]) => {
      request.field(key, value as string)
    })

    if (files) {
      Object.entries(files).forEach(([key, file]) => {
        request.attach(key, file.buffer, file.originalName)
      })
    }

    try {
      const result = await request
      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: POST`)
      throw sanitisedError
    }
  }

  async stream({ path = null, headers = {} }: StreamRequest = {}): Promise<Readable> {
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            logger.warn(sanitiseError(error), `Error calling ${this.name}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function,no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  async put<T>({ path = null, headers = {}, responseType = '', data = {} }: PutRequest = {}): Promise<T> {
    try {
      const result = await superagent
        .put(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PUT'`)
      throw sanitisedError
    }
  }
}
