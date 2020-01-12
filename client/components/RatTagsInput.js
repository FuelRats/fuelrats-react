// Module Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'




// Component Imports
import TagsInput from './TagsInput'





class RatTagsInput extends TagsInput {
  static renderLoader () {
    return (
      <span>
        <FontAwesomeIcon icon="spinner" pulse fixedWidth />
        Loading...
      </span>
    )
  }

  static renderValue (rat) {
    const badgeClasses = ['badge', 'platform', 'short', rat.attributes.platform]

    return (
      <span><span className={badgeClasses.join(' ')} /> {rat.attributes.name}</span>
    )
  }

  async search (query) {
    this.setState({ loading: true })

    const queryParams = [
      'limit=10',
      this.props['data-platform'] ? `platform=${this.props['data-platform']}` : '',
      `name.ilike=${query}%`,
    ]

    if (query) {
      const response = await fetch(`/api/rats?${queryParams.join('&')}`)
      const { data } = await response.json()

      if (!data.length) {
        return this.updateOptions([])
      }

      return this.updateOptions(data)
    }

    return this.updateOptions([])
  }
}



export default RatTagsInput
