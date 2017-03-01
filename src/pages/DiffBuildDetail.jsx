// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import { Grid, Accordion, Icon } from 'semantic-ui-react';
import { listDiffImages, listLittleDiffImages } from 'domains/DiffBuild';
import type { DiffBuild } from 'domains/DiffBuild';
import ImageDiff from 'components/ImageDiff';
import { setDocumentTitleWithAppName } from 'highorders/setDocumentTitle';
import style from 'styles/pages/DiffBuildDetail.css';

type Props = {
  diffBuild: DiffBuild,
  t: TFunction,
};

const DiffBuildDetail = ({ diffBuild, t }: Props) =>
  <div>
    <Grid className={style.myHeader}>
      <Grid.Row columns={3}>
        <Grid.Column>
          <h3>
            {t('diffBuild.diff')}
          </h3>
        </Grid.Column>
        <Grid.Column>
          <h3>
            {t('diffBuild.actual')}
            &nbsp;
            <a href={`https://circleci.com/gh/${diffBuild.username}/${diffBuild.reponame}/${diffBuild.actualBuildNum}`} target="self">
              {`#${diffBuild.actualBuildNum}`}
            </a>
          </h3>
        </Grid.Column>
        <Grid.Column>
          <h3>
            {t('diffBuild.expect')}
            &nbsp;
            <a href={`https://circleci.com/gh/${diffBuild.username}/${diffBuild.reponame}/${diffBuild.expectBuildNum}`} target="self">
              {`#${diffBuild.expectBuildNum}`}
            </a>
          </h3>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    {listDiffImages(diffBuild).map(x => (
      <ImageDiff key={x.path} value={x} />
    ))}
    <Accordion>
      <Accordion.Title>
        <Icon name="dropdown" />
        Little difference images
      </Accordion.Title>
      <Accordion.Content>
        {listLittleDiffImages(diffBuild).map(x => (
          <ImageDiff key={x.path} value={x} />
        ))}
      </Accordion.Content>
    </Accordion>
  </div>
;

export default compose(
  translate(''),
  connect(({ diffBuild }) => ({ diffBuild })),
  setDocumentTitleWithAppName(({ t }: Props) => t('diffBuild.title')),
)(DiffBuildDetail);
