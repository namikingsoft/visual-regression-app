// @flow
import { translate } from 'react-i18next';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import Through from 'components/Through';
import { setDocumentTitle } from 'highorders/setDocumentTitle';

type Props = {
  t: TFunction,
};

export default compose(
  translate(''),
  setDocumentTitle(({ t }: Props) => t('app.name')),
)(Through);
