import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { observer, inject } from 'mobx-react';

import SignInForm from './SignInForm';
import BasicFooter from '../../layouts/BasicFooter';

import './style.scss';

@inject('User')
@observer
export default class SignIn extends Component {
  static propTypes = {
    User: PropTypes.string,
    history: PropTypes.object,
  };

  onSubmit = (values) => {
    const { username, password } = values;
    const { User } = this.props;
    User.signIn({ username, password }, () => {
      const {
        history: { replace },
      } = this.props;
      replace('/home');
    });
  };

  render() {
    return (
      <div className="signIn">
        <Helmet>
          <title>登录 - SPA</title>
          <meta name="description" content="SPA" />
        </Helmet>
        <div className="header" />
        <div className="content">
          <div className="logo">
            <div className="title">Backstage management</div>
          </div>
          <SignInForm onSubmit={this.onSubmit} />
        </div>
        <BasicFooter className="footer" />
      </div>
    );
  }
}