import http from '@actions/http-client'
import { IHttpClient } from './interfaces'

export class HttpClient implements IHttpClient {
  private readonly actionHttpClient: http.HttpClient
  constructor (
    private readonly baseURL: string
  ) {
    this.actionHttpClient = new http.HttpClient()
  }

  public async get (resource: string): Promise<any> {
    const url = this.baseURL + resource

    const response = await this.actionHttpClient.getJson(url)

    return response.result
  }
}
