// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import { listDiffImages } from 'domains/DiffBuild';
import type { DiffBuild } from 'domains/DiffBuild';
import { setDocumentTitle } from 'highorders/setDocumentTitle';

type Props = {
  diffBuild: DiffBuild,
  t: TFunction,
};

const DiffBuildDetail = ({ diffBuild, t }: Props) =>
  <div>
    <h1>{t('diffBuild.title')}</h1>
    {listDiffImages(diffBuild).map(x => (
      <img src={x.diffImagePath} alt="" />
    ))}
  </div>
;

export default compose(
  translate(''),
  connect(({ diffBuild }) => ({ diffBuild })),
  setDocumentTitle(({ t }: Props) => t('diffBuild.title')),
)(DiffBuildDetail);
