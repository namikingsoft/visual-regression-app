// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import { listDiffImages } from 'domains/DiffBuild';
import type { DiffBuild } from 'domains/DiffBuild';
import ImageDiff from 'components/ImageDiff';
import { setDocumentTitle } from 'highorders/setDocumentTitle';

type Props = {
  diffBuild: DiffBuild,
  t: TFunction,
};

const DiffBuildDetail = ({ diffBuild, t }: Props) =>
  <div>
    <h2>{t('diffBuild.title')}</h2>
    {listDiffImages(diffBuild).map(x => (
      <ImageDiff key={x.path} value={x} />
    ))}
  </div>
;

export default compose(
  translate(''),
  connect(({ diffBuild }) => ({ diffBuild })),
  setDocumentTitle(({ t }: Props) => t('diffBuild.title')),
)(DiffBuildDetail);
