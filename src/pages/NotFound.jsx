// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import { setDocumentTitle } from 'highorders/setDocumentTitle';

type Props = {
  t: TFunction,
};

const NotFoundPage = ({ t }: Props) =>
  <div>{t('notFound.title')}</div>
;

export default compose(
  translate(''),
  setDocumentTitle(({ t }: Props) => t('notFound.title')),
)(NotFoundPage);
