// Module imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { produce } from 'immer'
import React from 'react'





// Component imports
import classNames from '../helpers/classNames'
import { connect } from '../store'
import { selectCurrentUserId } from '../store/selectors'
import ValidatedFormInput from './ValidatedFormInput'
import ValidatedFormSelect from './ValidatedFormSelect'




// Component Constants
const INVALID_NAME_MESSAGE = 'CMDR Name is Required'
const INVALID_PLATFORM_MESSAGE = 'Platform is Required'
const initialState = {
  formOpen: false,
  name: '',
  platform: '',
  validity: {
    name: INVALID_NAME_MESSAGE,
    platform: INVALID_PLATFORM_MESSAGE,
  },
  submitting: false,
}




@connect
class AddRatForm extends React.Component {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  state = {
    ...initialState,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _handleSubmit = async (event) => {
    const {
      createRat,
      userId,
    } = this.props
    const {
      name,
      platform,
    } = this.state

    event.preventDefault()

    this.setState({ submitting: true })

    await createRat({
      name,
      platform,
      userId,
    })

    this.setState({ ...initialState })
  }

  _handleToggle = () => {
    this.setState((state) => ({
      ...initialState,
      formOpen: !state.formOpen,
    }))
  }

  _handleFieldChange = ({ target, valid, message }) => {
    this.setState(produce((draftState) => {
      const { name, value } = target

      draftState[name] = value

      if (typeof draftState.validity[name] !== 'undefined') {
        draftState.validity[name] = valid || message
      }
    }))
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  render () {
    const {
      name,
      platform,
      submitting,
      formOpen,
    } = this.state

    const classes = classNames(
      'add-rat',
      'compact',
      ['form-open', formOpen],
    )

    return (
      <form className={classes}>
        {formOpen && (
          <div className="form-row submit-row flex align-center">
            <ValidatedFormInput
              aria-label="Commander Name"
              className="cmdr-input"
              disabled={submitting}
              id="newRatName"
              invalidMessage={INVALID_NAME_MESSAGE}
              label="CMDR Name"
              name="name"
              minLength={1}
              maxLength={18}
              onChange={this._handleFieldChange}
              placeholder="CMDR Name"
              required
              value={name} />

            <ValidatedFormSelect
              className="platform-input"
              disabled={submitting}
              id="newRatPlatform"
              invalidMessage={INVALID_PLATFORM_MESSAGE}
              name="platform"
              label="Platform"
              onChange={this._handleFieldChange}
              options={{
                pc: 'PC',
                xb: 'XB1',
                ps: 'PS4',
              }}
              required
              value={platform} />
          </div>
        )}
        <div className="form-control">
          {formOpen && (
            <button
              aria-label="submit new commander"
              className="green compact square"
              disabled={!this.canSubmit}
              onClick={this._handleSubmit}
              type="button">
              <FontAwesomeIcon icon="check" fixedWidth />
            </button>
          )}
          <button
            aria-label={formOpen ? 'cancel new commander creation' : 'add commander'}
            className={`compact square ${formOpen ? '' : 'green'}`}
            onClick={this._handleToggle}
            title={formOpen ? 'Cancel' : 'Add new commander'}
            type="button">
            <FontAwesomeIcon icon={formOpen ? 'times' : 'plus'} fixedWidth />
          </button>
        </div>
      </form>
    )
  }





  /***************************************************************************\
    Getters
  \***************************************************************************/

  get canSubmit () {
    const {
      name,
      platform,
      validity,
    } = this.state

    const isValid = Object.values(validity).filter((validityMember) => validityMember).length

    return name && platform && isValid
  }





  /***************************************************************************\
    Redux Properties
  \***************************************************************************/

  static mapDispatchToProps = ['createRat']

  static mapStateToProps = (state, ownProps) => ({
    userId: ownProps.userId || selectCurrentUserId(state),
  })
}





export default AddRatForm
