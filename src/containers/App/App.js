import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Alert from 'react-bootstrap/lib/Alert';
import Helmet from 'react-helmet';
import { isLoaded as isInfoLoaded, load as loadInfo } from 'redux/modules/info';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
import { Notifs, InfoBar } from 'components';
import config from 'config';

@provideHooks({
  fetch: async ({ store: { dispatch, getState } }) => {
    if (!isAuthLoaded(getState())) {
      await dispatch(loadAuth()).catch(() => null);
    }
    if (!isInfoLoaded(getState())) {
      await dispatch(loadInfo()).catch(() => null);
    }
  }
})
@connect(
  state => ({
    notifs: state.notifs,
    user: state.auth.user
  }),
  { logout, pushState: push }
)
@withRouter
export default class App extends Component {
  static propTypes = {
    route: PropTypes.objectOf(PropTypes.any).isRequired,
    location: PropTypes.objectOf(PropTypes.any).isRequired,
    user: PropTypes.shape({
      email: PropTypes.string
    }),
    notifs: PropTypes.shape({
      global: PropTypes.array
    }).isRequired,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static defaultProps = {
    user: null
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!prevState.user && nextProps.user) {
      const query = new URLSearchParams(nextProps.location.search);
      nextProps.pushState(query.get('redirect') || '/login-success');
      return {
        user: nextProps.user
      };
    } else if (prevState.user && !nextProps.user) {
      nextProps.pushState('/');
      return {
        user: null
      };
    }
    return null;
  }

  state = {
    user: null
  };
  /* Made Unsafe as per React Docs v16.3 */
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props.user);
  //   console.log(nextProps.user);
  //   if (!this.props.user && nextProps.user) {
  //     // login
  //     const query = new URLSearchParams(this.props.location.search);
  //     this.props.pushState(query.get('redirect') || '/login-success');
  //   } else if (this.props.user && !nextProps.user) {
  //     // logout
  //     this.props.pushState('/');
  //   }
  // }
  /* Unsafe as per v16.3 */

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  handleLogout = event => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const { notifs, route } = this.props;
    const { user } = this.state;
    const styles = require('./App.scss');

    return (
      <div className={styles.app}>
        <Helmet {...config.app.head} />
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLinkContainer to="/" activeStyle={{ color: '#33e0ff' }} className={styles.title}>
                <div className={styles.brand}>
                  <span>{config.app.title}</span>
                </div>
              </IndexLinkContainer>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav navbar>
              <LinkContainer to="/chat">
                <NavItem>Chat</NavItem>
              </LinkContainer>
              <LinkContainer to="/about">
                <NavItem>About Us</NavItem>
              </LinkContainer>

              {!user && (
                <LinkContainer to="/login">
                  <NavItem>Login</NavItem>
                </LinkContainer>
              )}
              {!user && (
                <LinkContainer to="/register">
                  <NavItem>Register</NavItem>
                </LinkContainer>
              )}
              {user && (
                <LinkContainer to="/logout">
                  <NavItem className="logout-link" onClick={this.handleLogout}>
                    Logout
                  </NavItem>
                </LinkContainer>
              )}
            </Nav>
            {user && (
              <p className="navbar-text">
                <strong>{user.email}</strong>
              </p>
            )}
            <Nav navbar pullRight>
              <NavItem
                target="_blank"
                title="View on Github"
                href="https://github.com/bertho-zero/react-redux-universal-hot-example"
              >
                <i className="fa fa-github" />
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className={styles.appContent}>
          {notifs.global && (
            <div className="container">
              <Notifs
                className={styles.notifs}
                namespace="global"
                NotifComponent={props => <Alert bsStyle={props.kind}>{props.message}</Alert>}
              />
            </div>
          )}

          {renderRoutes(route.routes)}
        </div>
        <InfoBar />

        <div className="well text-center">
          Have questions? Ask for help{' '}
          <a
            href="https://github.com/bertho-zero/react-redux-universal-hot-example/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            on Github
          </a>.
        </div>
      </div>
    );
  }
}
