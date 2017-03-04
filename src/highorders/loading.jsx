// @flow
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Dimmer, Loader } from 'semantic-ui-react';
import { compose } from 'recompose';
import { isLoading } from 'domains/Loading';
import type { Loading } from 'domains/Loading';
import type { TFunction } from 'i18next';

type AddedProps = {
  loading: Loading,
  t: TFunction,
};

type Props = AddedProps & {
  children: any,
};

const loadingHOC:
  <T:any>(T => React$Element<*>) => (T & AddedProps) => React$Element<*>
= Component => compose(
  translate(''),
  connect(({ loading }) => ({ loading })),
)(({ loading, t, ...props }: Props) => (
  <div>
    <Component {...(props: any)} />
    <Dimmer active={isLoading(loading)} page>
      <Loader active={isLoading(loading)} size="big">
        {t('app.loading')}
      </Loader>
    </Dimmer>
  </div>
));

export default loadingHOC;
