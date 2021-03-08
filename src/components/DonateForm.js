import { HttpStatus } from '@fuelrats/web-util/http'
import { isError } from 'flux-standard-action'
import { produce } from 'immer'
import PropTypes from 'prop-types'
import React from 'react'
import { createStructuredSelector } from 'reselect'

import getFingerprint from '~/helpers/getFingerprint'
import getMoney from '~/helpers/getMoney'
import { connect } from '~/store'
import { withCurrentUserId, selectUserById } from '~/store/selectors'

import RadioInput from './RadioInput'
import StripeBadge from './StripeBadge'





const presetAmounts = {
  one: 1.00,
  five: 5.00,
  ten: 10.00,
  twenty: 20.00,
  custom: '',
}

const currencyValidator = /^[0-9]{0,6}(\.[0-9]{0,2})?$/u

const currencyOptions = [
  {
    value: 'eur',
    label: '€ EUR',
    title: 'Euro',
  },
  {
    value: 'gbp',
    label: '£ GBP',
    title: 'Great British Pounds',
  },
  {
    value: 'usd',
    label: '$ USD',
    title: 'United States Dollars',
  },
]

const amountOptions = (prefix) => {
  return [
    {
      value: 'one',
      label: `${prefix}1.00`,
    },
    {
      value: 'five',
      label: `${prefix}5.00`,
    },
    {
      value: 'ten',
      label: `${prefix}10.00`,
    },
    {
      value: 'twenty',
      label: `${prefix}20.00`,
    },
    {
      value: 'custom',
      label: 'Custom Amount',
    },
  ]
}





@connect
class DonateForm extends React.Component {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  state = {
    amount: 0,
    amountType: '',
    currency: '',
    error: null,
    submitting: false,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _handleFieldChange = ({ target }) => {
    this.setState(produce((draftState) => {
      const { name } = target
      const { value } = target

      if (name === 'amount' && !value.match(currencyValidator)) {
        return
      }

      if (name === 'amountType') {
        draftState.amount = presetAmounts[value]
      }

      draftState[name] = value.replace(/^0+/u, '')
    }))
  }

  _handleSubmit = async (event) => {
    event.preventDefault()
    if (!this.canSubmit) {
      return
    }

    this.setState({ error: false, submitting: true })

    const {
      createDonationSession,
      stripe,
      user,
    } = this.props

    const {
      currency,
    } = this.state

    const fingerprint = await getFingerprint()

    const sessionData = {
      amount: this.stripeAmount,
      currency,
      fingerprint,
    }

    if (user) {
      const { email, stripeId } = user.attributes

      if (stripeId) {
        sessionData.customer = stripeId
      } else {
        sessionData.email = email
      }
    }

    const response = await createDonationSession(sessionData)

    if (isError(response)) {
      this.setState({
        error: response.payload?.errors?.[0] ?? true,
        submitting: false,
      })
      return
    }

    try {
      await stripe.redirectToCheckout({ sessionId: response.payload.data.id })
    } catch (error) {
      this.setState({
        error: {
          detail: error.message,
        },
        submitting: false,
      })
    }

    this.setState({ submitting: false })
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  renderError () {
    const { error } = this.state
    return (
      <div className="store-errors">
        <div className="store-error">
          <h5 className="title">{error.title ?? 'Unknown Error'}</h5>
          <span className="detail">{error.detail}</span>
          <br />
          <small className="footer">
            {
              error.code === HttpStatus.UNAUTHORIZED
                ? (
                  <>
                    {'If you believe this is an error, Please appeal via email: '}
                    <a href="mailto:ops@fuelrats.com">{'ops@fuelrats.com'}</a>
                  </>
                )
                : (
                  <>
                    {'If the problem persists, please contact a techrat via email: '}
                    <a href="mailto:support@fuelrats.com">{'support@fuelrats.com'}</a>
                  </>
                )
            }
          </small>

        </div>
      </div>
    )
  }


  render () {
    const {
      amount,
      amountType,
      currency,
      error,
      submitting,
    } = this.state

    const { currencySymbol } = this

    return (
      <>
        {!submitting && error && this.renderError()}
        <form className="donate-form compact" onSubmit={this._handleSubmit}>
          <fieldset>
            <label htmlFor="currency">{'Select your currency'}</label>

            <RadioInput
              disabled={submitting}
              id="currency"
              name="currency"
              options={currencyOptions}
              value={currency}
              onChange={this._handleFieldChange} />
          </fieldset>

          <fieldset>
            <label htmlFor="amountType">{'Select your amount'}</label>

            <RadioInput
              disabled={submitting || !currency}
              id="amountType"
              name="amountType"
              options={amountOptions(currencySymbol)}
              value={amountType}
              onChange={this._handleFieldChange} />
          </fieldset>

          {
            amountType === 'custom' && (
              <fieldset>
                <label htmlFor="amount">{'Input your custom amount'}</label>

                <input
                  aria-label="Custom amount"
                  disabled={submitting || amountType !== 'custom'}
                  id="DonateAmount"
                  name="amount"
                  type="text"
                  value={amount}
                  onChange={this._handleFieldChange} />
              </fieldset>
            )
          }

          <div className="fieldset">
            <button
              className="green"
              disabled={submitting || !this.canSubmit}
              type="submit">
              {'Donate '}
              {Boolean(this.canSubmit) && getMoney(this.stripeAmount, currency)}
            </button>
          </div>
          <StripeBadge className="donation-info-badge" />
        </form>
      </>
    )
  }





  /***************************************************************************\
    Getters
  \***************************************************************************/

  get canSubmit () {
    const { stripe } = this.props
    const {
      amount,
      currency,
    } = this.state

    return Boolean(
      stripe
      && amount
      && amount >= 1
      && currency,
    )
  }

  get stripeAmount () {
    return this.state.amount * 100
  }

  get currencySymbol () {
    switch (this.state.currency) {
      case 'gbp':
        return '£'

      case 'usd':
        return '$'

      default:
        return '€'
    }
  }




  /***************************************************************************\
    Redux Properties
  \***************************************************************************/

  static mapDispatchToProps = ['createDonationSession']

  static mapStateToProps = createStructuredSelector({
    user: withCurrentUserId(selectUserById),
  })





  /***************************************************************************\
    Prop Definitions
  \***************************************************************************/

  static defaultProps = {
    stripe: null,
  }

  static propTypes = {
    createDonationSession: PropTypes.func,
    stripe: PropTypes.object,
    user: PropTypes.object,
  }
}





export default DonateForm
