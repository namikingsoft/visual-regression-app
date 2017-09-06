// @flow
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Container, Dimmer, Loader, Progress } from 'semantic-ui-react';
import { compose } from 'recompose';
import { isLoading } from 'domains/Loading';
import type { Loading as LoadingState } from 'domains/Loading';
import type { Progress as ProgressState } from 'domains/Progress';
import type { TFunction } from 'i18next';
import style from 'styles/highorders/loading.css';

type AddedProps = {
  loading: LoadingState,
  progress: ProgressState,
  t: TFunction,
};

type Props = AddedProps & {
  children: any,
};

const loadingHOC:
  <T:any>(T => React$Element<*>) => (T & AddedProps) => React$Element<*>
= Component => compose(
  translate(''),
  connect(({ loading, progress }) => ({ loading, progress })),
)(({ loading, progress, t, ...props }: Props) => (
  <div>
    <Component {...(props: any)} />
    <Dimmer active={isLoading(loading) || progress.show} page>
      <Container>
        {isLoading(loading) &&
          <Loader
            className={style.myLoader}
            active={isLoading(loading)}
            size="big"
          >
            {t('app.loading')}
          </Loader>
        }
        {progress.show &&
          <Progress
            className={style.myProgress}
            percent={progress.percent}
            size="small"
            inverted
            indicating
            autoSuccess
          >
            {t('progress')[(progress.label: any)] || progress.label}
          </Progress>
        }
      </Container>
    </Dimmer>
  </div>
));

export default loadingHOC;
