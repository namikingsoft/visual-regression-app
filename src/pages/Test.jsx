// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import { setDocumentTitle } from 'highorders/setDocumentTitle';

type Props = {
  t: TFunction,
};

const TestPage = ({ t }: Props) =>
  <div>{t('test.title')}</div>
;

export default compose(
  translate(''),
  setDocumentTitle(({ t }: Props) => t('test.title')),
)(TestPage);
