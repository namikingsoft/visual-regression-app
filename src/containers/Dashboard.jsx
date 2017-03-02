// @flow
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Container, Dimmer, Loader } from 'semantic-ui-react';
import { compose } from 'recompose';
import { isLoading } from 'domains/Loading';
import type { Loading } from 'domains/Loading';
import type { TFunction } from 'i18next';

type Props = {
  loading: Loading,
  children: any,
  t: TFunction,
};

const Dashboard = ({ loading, children, t }: Props) =>
  <Container>
    <h1>{t('app.name')}</h1>
    {children}
    <Dimmer active={isLoading(loading)} page>
      <Loader active={isLoading(loading)} size="big">
        {t('app.loading')}
      </Loader>
    </Dimmer>
  </Container>
;

export default compose(
  translate(''),
  connect(({ loading }) => ({ loading })),
)(Dashboard);
