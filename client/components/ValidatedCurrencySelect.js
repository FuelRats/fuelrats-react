// Module imports
import React from 'react'
import PropTypes from 'prop-types'

// Component imports
import currencyList from '../data/CurrencyList'
import classNames from '../helpers/classNames'




class ValidatedCurrencySelect extends React.Component {
  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _handleChange = ({ target }) => {
    const {
      invalidMessage,
      label,
      onChange,
      required,
    } = this.props
    const {
      value,
    } = target

    let valid = true
    let message = null

    if (required && value === '') {
      valid = false
      message = invalidMessage || `${label} is Required`
    }

    onChange({
      target,
      valid,
      message,
    })
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  render () {
    const {
      className,
      id,
      label,
      renderLabel,
      required,
    } = this.props

    const classes = classNames(
      'form-select',
      ['required', required],
      [className, className],
    )

    return (
      <fieldset>
        {renderLabel && <label htmlFor={id}>{label}</label>}
        <div className="select-wrapper">
          <select
            {...this.selectProps}
            className={classes}
            onChange={this._handleChange}>
            {!renderLabel && (<option value="">{label}</option>)}
            {currencyList.map(({ CurrencyCode, Text }) => (
              <option
                key={CurrencyCode}
                value={CurrencyCode}>
                {Text}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
    )
  }


  get selectProps () {
    const inputProps = { ...this.props }

    delete inputProps.invalidMessage
    delete inputProps.label
    delete inputProps.renderLabel
    delete inputProps.onChange

    if (!inputProps.name) {
      inputProps.name = inputProps.id
    }

    return inputProps
  }


  static defaultProps = {
    invalidMessage: null,
    name: null,
    onChange: () => ({}),
    renderLabel: false,
    required: false,
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    invalidMessage: PropTypes.string,
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    onChange: PropTypes.func,
    renderLabel: PropTypes.bool,
    required: PropTypes.any,
  }
}




export default ValidatedCurrencySelect
