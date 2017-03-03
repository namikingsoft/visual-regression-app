// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import { Grid, Accordion, Icon, List, Image } from 'semantic-ui-react';
import { listDiffImages, listLittleDiffImages } from 'domains/DiffBuild';
import type { DiffBuild } from 'domains/DiffBuild';
import ImageDiff from 'components/ImageDiff';
import ModalImage from 'components/ModalImage';
import { setDocumentTitleWithAppName } from 'highorders/setDocumentTitle';
import style from 'styles/pages/DiffBuildDetail.css';

type Props = {
  diffBuild: DiffBuild,
  t: TFunction,
};

const DiffBuildDetail = ({ diffBuild, t }: Props) =>
  <div>
    <List className={style.myList}>
      {diffBuild.newImages.map(x => (
        <List.Item key={`new${x.path}`} className={style.myListItem}>
          <ModalImage image={<Image src={x.imagePath} />} />
          <List.Content><Icon name="plus" color="green" /> {x.path}</List.Content>
        </List.Item>
      ))}
      {diffBuild.delImages.map(x => (
        <List.Item key={`del${x.path}`} className={style.myListItem}>
          <ModalImage image={<Image src={x.imagePath} />} />
          <List.Content><Icon name="minus" color="red" /> {x.path}</List.Content>
        </List.Item>
      ))}
    </List>
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
    <Accordion className={style.myLittleDiffImages}>
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
