// Module imports
import { produce } from 'immer'
import getConfig from 'next/config'
import PropTypes from 'prop-types'
import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'




// Component imports
import { createStructuredSelector } from 'reselect'
import getMoney from '../helpers/getMoney'
import { connect, actionStatus } from '../store'
import { withCurrentUserId, selectUserById } from '../store/selectors'
import RadioInput from './RadioInput'
import StripeBadgeSvg from './svg/StripeBadgeSvg'





// Component Constants
const { publicRuntimeConfig } = getConfig()

const recaptchaPublicKey = publicRuntimeConfig.apis.recaptcha.public

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

const amountOptions = (prefix) => [
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





@connect
class DonateForm extends React.Component {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  state = {
    amount: 0,
    amountType: '',
    captchaValue: null,
    currency: '',
    error: null,
    submitting: false,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _handleFieldChange = ({ target }) => this.setState(produce((draftState) => {
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

  _handleCaptchaChange = (captchaValue) => {
    this.setState({ captchaValue })
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
      captchaValue,
    } = this.state

    const sessionData = {
      amount: this.stripeAmount,
      currency,
      recaptcha: captchaValue,
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

    if (response.status === actionStatus.ERROR) {
      this.setState({
        error: response.payload?.errors?.[0]?.source?.message ?? true,
        submitting: false,
      })
      return
    }

    try {
      await stripe.redirectToCheckout({ sessionId: response.payload.id })
    } catch (error) {
      this.setState({ error: error.message, submitting: false })
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
          {'An error occured while creating the checkout session.'}
          {do {
            if (typeof error === 'string') {
              <>
                {' Error message: '}
                <br />
                {error}
              </>
            }
          }}
          <br />
          {'If the problem persists, please contact a techrat via'}
          <a href="mailto:support@fuelrats.com">{'support@fuelrats.com'}</a>
          {'.'}
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
            <label htmlFor="currency">Select your currency</label>

            <RadioInput
              disabled={submitting}
              name="currency"
              id="currency"
              value={currency}
              onChange={this._handleFieldChange}
              options={currencyOptions} />
          </fieldset>

          <fieldset>
            <label htmlFor="amountType">Select your amount</label>

            <RadioInput
              disabled={submitting || !currency}
              name="amountType"
              id="amountType"
              value={amountType}
              onChange={this._handleFieldChange}
              options={amountOptions(currencySymbol)} />
          </fieldset>

          {amountType === 'custom' && (
            <fieldset>
              <label htmlFor="amount">Input your custom amount</label>

              <input
                aria-label="Custom amount"
                disabled={submitting || amountType !== 'custom'}
                id="DonateAmount"
                name="amount"
                type="text"
                onChange={this._handleFieldChange}
                value={amount} />
            </fieldset>
          )}

          {recaptchaPublicKey && (
            <fieldset>
              <ReCAPTCHA
                className="recaptcha-wrapper"
                sitekey={recaptchaPublicKey}
                onChange={this._handleCaptchaChange} />
            </fieldset>
          )}

          <div className="fieldset">
            <button
              disabled={submitting || !this.canSubmit}
              type="submit">
              {'Donate '}
              {Boolean(this.canSubmit) && getMoney(this.stripeAmount, currency)}
            </button>
          </div>
          <StripeBadgeSvg className="donation-info-badge" />
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
      captchaValue,
      currency,
    } = this.state

    return Boolean(
      stripe
      && amount
      && amount >= 1
      && captchaValue
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
    stripe: PropTypes.object,
  }
}





export default DonateForm
