import http from '@actions/http-client'
import { IHttpClient, Result } from './interfaces'

export class HttpClient implements IHttpClient {
  private readonly actionHttpClient: http.HttpClient

  constructor (private readonly baseURL: string) {
    this.actionHttpClient = new http.HttpClient()
  }

  public async get (resource: string): Promise<Result<any>> {
    const url = this.baseURL + resource

    try {
      const response = await this.actionHttpClient.getJson(url)
      return { right: response.result as any }
    } catch (error) {
      return { left: new Error('' + error) }
    }
  }
}
