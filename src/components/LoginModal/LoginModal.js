import asModal, { ModalContent, useModalContext } from '~/components/asModal'
import { connect } from '~/store'
import { setFlag } from '~/store/actions/flags'
import { selectFlagByName } from '~/store/selectors'

import styles from './LoginModal.module.scss'
import LoginModalErrorBox from './LoginModalErrorBox'
import LoginView from './LoginView'
import ResetView from './ResetView'
import VerifyView from './VerifyView'




function LoginModal () {
  const [{ error, view }] = useModalContext()
  return (
    <ModalContent className={[styles.loginModal, 'no-pad']}>
      <LoginModalErrorBox className={styles.errorBox} error={error} />
      {view === 'login' && (<LoginView />)}
      {view === 'verify' && (<VerifyView />)}
      {view === 'reset' && (<ResetView />)}
    </ModalContent>
  )
}

/* we're binding these via connect so they get passed to the modal wrapper */
LoginModal.mapDispatchToProps = {
  onClose: () => {
    return setFlag('showLoginDialog', false)
  },
}

LoginModal.mapStateToProps = (state) => {
  return {
    isOpen: selectFlagByName(state, { name: 'showLoginDialog' }),
  }
}


export default connect(
  asModal(
    {
      className: 'login-dialog',
      title: 'Login',
      initialState: { view: 'login' },
    },
  )(LoginModal),
)
