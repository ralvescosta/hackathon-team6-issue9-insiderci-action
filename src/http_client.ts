import * as http from '@actions/http-client'
import { IHttpClient, Result } from './interfaces'

export class HttpClient implements IHttpClient {
  constructor (
    private readonly _actionHttpClient: http.HttpClient,
    private readonly baseURL: string
  ) {}

  public async get (resource: string): Promise<Result<any>> {
    const url = `${this.baseURL}/${resource}`

    try {
      const response = await this._actionHttpClient.getJson(url)
      return { right: response.result as any }
    } catch (error) {
      return { left: new Error(`${error}`) }
    }
  }
}
