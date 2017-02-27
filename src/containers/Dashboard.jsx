// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { Container } from 'semantic-ui-react';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';

type Props = {
  children: any,
  t: TFunction,
};

const Dashboard = ({ children, t }: Props) =>
  <Container>
    <h1>{t('app.name')}</h1>
    {children}
  </Container>
;

export default compose(
  translate(''),
)(Dashboard);
