// Module imports
import React from 'react'

// Component imports
import { formatAsEliteDateLong } from '../helpers/formatTime'
import { connect } from '../store'
import {
  selectUserById,
  selectDisplayRatByUserId,
  selectAvatarByUserId,
  withCurrentUserId,
} from '../store/selectors'
import ChangePasswordModal from './ChangePasswordModal'





@connect
class ProfileHeader extends React.Component {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  state = {
    showChangePassword: false,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/
  _renderUserGroups = () => (
    this.props.user.relationships.groups.data && (
      this.props.user.relationships.groups.data.map((item) => (
        <li className={`badge ${item.id}`} key={item.id}>
          {item.id}
        </li>
      ))))

  _handleToggleChangePassword = () => {
    this.setState((state) => ({ showChangePassword: !state.showChangePassword }))
  }



  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  render () {
    const {
      showChangePassword,
    } = this.state
    const {
      displayRat,
      userAvatar,
    } = this.props

    const attributes = this.props.user.attributes || {}

    const {
      createdAt,
      email,
    } = attributes

    return (
      <>
        <div className="profile-header">
          <div className="user-avatar">
            <div className="avatar xl"><img alt="User's avatar" src={userAvatar} /></div>
          </div>
          <div className="profile-basic-info">
            <div className="rat-name">
              {displayRat.attributes.name}
            </div>
            <div className="email">
              <span className="label">E-Mail:</span> <span>{email}</span>
            </div>
            <div className="member-since">
              <span className="label">Date joined: </span> <span>{formatAsEliteDateLong(createdAt)}</span>
            </div>
          </div>
          <div className="profile-user-badges">
            <ul>
              {this._renderUserGroups()}
            </ul>
          </div>
          <div className="profile-controls">
            <button
              onClick={this._handleToggleChangePassword}
              type="button">
              Change Password
            </button>
          </div>
        </div>
        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={this._handleToggleChangePassword} />
      </>
    )
  }





  /***************************************************************************\
    Redux Properties
  \***************************************************************************/

  static mapStateToProps = (state) => ({
    user: withCurrentUserId(selectUserById)(state),
    userAvatar: withCurrentUserId(selectAvatarByUserId)(state),
    displayRat: withCurrentUserId(selectDisplayRatByUserId)(state),
  })
}





export default ProfileHeader
