import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import qs from 'qs'

import TagsInput from './TagsInput'





class RatTagsInput extends TagsInput {
  static renderLoader () {
    return (
      <span>
        <FontAwesomeIcon fixedWidth pulse icon="spinner" />
        {'Loading...'}
      </span>
    )
  }

  static renderValue (rat) {
    return (
      <span>
        <span className={['badge platform short', rat.attributes.platform]} />
        {rat.attributes.name}
      </span>
    )
  }

  async search (query) {
    this.setState({ loading: true })

    const queryParams = qs.stringify({
      page: {
        limit: 10,
      },
      filter: {
        and: [
          { name: { iLike: `${query}%` } },
          { platform: this.props['data-platform'] },
        ],
      },
    })

    if (query) {
      const response = await fetch(`/api/fr/rats?${queryParams}`)
      const { data } = await response.json()

      if (!data?.length) {
        return this.updateOptions([])
      }

      return this.updateOptions(data)
    }

    return this.updateOptions([])
  }
}



export default RatTagsInput
