import { errorLoggerMiddleware, FSAComplianceMiddleware } from '@fuelrats/web-util/redux-middleware'
import { connect } from 'react-redux'
import {
  bindActionCreators,
  createStore,
  applyMiddleware,
} from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'


import frSocket from '~/services/frSocket'


import * as authenticationActions from './actions/authentication'
import * as blogActions from './actions/blogs'
import * as decalActions from './actions/decals'
import * as epicActions from './actions/epics'
import * as flagActions from './actions/flags'
import * as imageActions from './actions/images'
import * as ratActions from './actions/rats'
import * as rescueActions from './actions/rescues'
import * as serviceActions from './actions/services'
import * as sessionActions from './actions/session'
import * as shipActions from './actions/ships'
import * as statisticsActions from './actions/statistics'
import * as stripeActions from './actions/stripe'
import * as userActions from './actions/user'
import * as verifyActions from './actions/verify'
import * as wordpressActions from './actions/wordpress'
import actionTypes from './actionTypes'
import initialState from './initialState'
import reducer from './reducers'

const actions = {
  ...authenticationActions,
  ...blogActions,
  ...decalActions,
  ...epicActions,
  ...flagActions,
  ...imageActions,
  ...ratActions,
  ...rescueActions,
  ...serviceActions,
  ...sessionActions,
  ...shipActions,
  ...statisticsActions,
  ...stripeActions,
  ...userActions,
  ...verifyActions,
  ...wordpressActions,
}





const ignoredTypes = [
  // This pops up on every 404 page due to how our fallback system works, therefore it's not generally helpful to log.
  actionTypes.wordpress.pages.read,
]

const middlewares = [thunkMiddleware, frSocket.createMiddleware(), errorLoggerMiddleware(ignoredTypes)]
if ($$BUILD.isDev) {
  middlewares.unshift(require('redux-immutable-state-invariant').default())
  middlewares.push(FSAComplianceMiddleware)
}





const initStore = (state = initialState) => {
  return createStore(reducer, state, composeWithDevTools(applyMiddleware(...middlewares)))
}





const connectDecorator = (target) => {
  const {
    mapDispatchToProps: mDTP,
    mapStateToProps,
    mergeProps,
    reduxOptions,
  } = target
  let mapDispatchToProps = mDTP

  if (Array.isArray(mDTP)) {
    mapDispatchToProps = (dispatch) => {
      return bindActionCreators(
        mDTP.reduce(
          (acc, actionName) => {
            return {
              ...acc,
              [actionName]: actions[actionName],
            }
          },
          {},
        ),
        dispatch,
      )
    }
  }

  return connect(
    mapStateToProps || (() => {
      return {}
    }),
    mapDispatchToProps || {},
    mergeProps,
    reduxOptions,
  )(target)
}





const getActionCreators = (action, dispatch) => {
  let resolvedAction = action

  if (Array.isArray(action) && typeof action[0] === 'string') {
    resolvedAction = action.reduce((acc, actionName) => {
      return {
        ...acc,
        [actionName]: actions[actionName],
      }
    }, {})
  }

  if (typeof action === 'string') {
    resolvedAction = actions[action]
  }

  return bindActionCreators(resolvedAction, dispatch)
}





export {
  getActionCreators,
  connectDecorator as connect,
  initStore,
}
