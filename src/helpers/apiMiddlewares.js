import { isRequired } from '@fuelrats/validation-util'
import { HttpStatus } from '@fuelrats/web-util/http'




export function methodRouter (handlers = isRequired('handlers')) {
  return (req, res) => {
    const methodHandler = handlers[req.method]

    if (typeof methodHandler === 'function') {
      methodHandler(req, res)
    }

    res.setHeader('Allow', Object.keys(handlers))
    res.status(HttpStatus.METHOD_NOT_ALLOWED).end(`Method ${req.method} Not Allowed`)
  }
}
