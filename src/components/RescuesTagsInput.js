import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Cookies from 'js-cookie'

import TagsInput from './TagsInput'





class RescuesTagsInput extends TagsInput {
  static renderLoader () {
    return (
      <span>
        <FontAwesomeIcon fixedWidth pulse icon="spinner" />
        {'Loading...'}
      </span>
    )
  }

  renderValue (rescue) {
    const operationName = rescue.attributes.title ? `Operation ${rescue.attributes.title}` : null
    const clientDetails = `Rescue of ${rescue.attributes.client || 'unknown'} [${rescue.attributes.platform || 'N/A'}] in ${rescue.attributes.system || 'unknown'}`

    return (
      <span>{rescue.id}{` (${operationName}` || `${clientDetails})`}</span>
    )
  }

  async search (query) {
    this.setState({ loading: true })

    if (query) {
      try {
        const token = Cookies.get('access_token')

        let response = await fetch(`/api/fr/rescues/${query}`, {
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        })
        response = await response.json()

        if (response.errors) {
          throw new Error('BadQuery!')
        }

        const { data } = response

        return this.updateOptions(data)
      } catch (error) {
        return this.updateOptions([])
      }
    }
    return this.updateOptions([])
  }
}





export default RescuesTagsInput
