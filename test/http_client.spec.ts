import { HttpClient } from '../src/http_client'

const makeSut = () => {
  const baseURL = 'some_url'
  const httpd = {
    getJson: jest.fn(() => ({ result: {} }))
  }
  const sut = new HttpClient(httpd as any, baseURL)

  return { sut, httpd, baseURL }
}
describe('#HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#get', () => {
    it('should return a release json when run correctly', async () => {
      const { sut, httpd } = makeSut()

      const result = await sut.get('some_resource')

      expect(result.left).toBeUndefined()
      expect(httpd.getJson).toHaveBeenCalledTimes(1)
    })

    it('should return erro if something wrong occur', async () => {
      const { sut, httpd } = makeSut()
      jest.spyOn(httpd, 'getJson').mockRejectedValueOnce(new Error('') as never)

      const result = await sut.get('some_resource')

      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
      expect(httpd.getJson).toHaveBeenCalledTimes(1)
    })
  })
})
