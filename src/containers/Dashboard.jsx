// @flow
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { compose } from 'recompose';
import { Container, Menu, Icon } from 'semantic-ui-react';
import type { TFunction } from 'i18next';
import style from 'styles/containers/Dashboard.css';

type Props = {
  children: any,
  t: TFunction,
};

const Dashboard = ({ t, children }: Props) =>
  <div className={style.my}>
    <Menu className={style.myMenu} color="black" inverted>
      <Menu.Item header>
        <Icon name="image" /> {t('app.name')}
      </Menu.Item>
    </Menu>
    <Container className={style.myContainer}>
      {children}
    </Container>
  </div>
;

export default compose(
  translate(''),
  connect(({ diffBuild }) => ({ diffBuild })),
)(Dashboard);
