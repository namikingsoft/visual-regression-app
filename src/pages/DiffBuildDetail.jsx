// @flow
import React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import type { TFunction } from 'i18next';
import {
  Grid,
  Accordion,
  Icon,
  List,
  Image,
  Statistic,
} from 'semantic-ui-react';
import {
  listManyDiffImages,
  listLessDiffImages,
  countManyDiff,
  countLessDiff,
  isLoaded,
  isSuccess,
} from 'domains/DiffBuild';
import type { DiffBuild } from 'domains/DiffBuild';
import ImageDiff from 'components/ImageDiff';
import ModalImage from 'components/ModalImage';
import { setDocumentTitleWithAppName } from 'highorders/setDocumentTitle';
import style from 'styles/pages/DiffBuildDetail.css';

type Props = {
  diffBuild: DiffBuild,
  t: TFunction,
};

const Headline = ({ diffBuild, t }: Props) => (isSuccess(diffBuild) ?
  <h1 className={style.myHeadline}>
    <Icon name="check circle outline" color="green" size="big" />
    {t('diffBuild.success')}
  </h1>
  :
  <h1 className={style.myHeadline}>
    <Icon name="remove circle outline" color="red" size="big" />
    {t('diffBuild.failed')}
  </h1>
);

const Statistics = ({ diffBuild, t }: Props) =>
  <div className={style.myStatistics}>
    <Statistic
      value={countManyDiff(diffBuild)}
      label={t('diffBuild.manyCount')}
      color={isSuccess(diffBuild) ? 'green' : 'red'}
    />
    <Statistic
      value={countLessDiff(diffBuild)}
      label={t('diffBuild.lessCount')}
      color="grey"
      size="small"
    />
    <Statistic>
      <Statistic.Value>
        {`${diffBuild.maxPercentage.toFixed(4)}%`}
      </Statistic.Value>
      <Statistic.Label>
        {`${t('diffBuild.maxPercentage')} `}
        {isSuccess(diffBuild) ?
          <Icon name="chevron left" color="green" />
        : <Icon name="chevron right" color="red" />
        }
        {`${diffBuild.threshold}%`}
      </Statistic.Label>
    </Statistic>
    <Statistic
      value={`${diffBuild.avgPercentage.toFixed(4)}%`}
      label={t('diffBuild.avgPercentage')}
      size="small"
    />
    <Statistic
      value={diffBuild.newImages.length}
      label={t('diffBuild.newImageCount')}
      size="small"
    />
    <Statistic
      value={diffBuild.delImages.length}
      label={t('diffBuild.delImageCount')}
      size="small"
    />
  </div>
;

const DiffImages = ({ diffBuild, t }: Props) =>
  <div className={style.myDiffImages}>
    <Grid className={style.myDiffImagesHeader}>
      <Grid.Row columns={3}>
        <Grid.Column>
          <h2><Icon name="picture" /> {t('diffBuild.differenceImages')}</h2>
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
    {listManyDiffImages(diffBuild).map(x => (
      <ImageDiff key={x.path} value={x} />
    ))}
    <Accordion className={style.myDiffImagesLesses}>
      <Accordion.Title>
        <Icon name="dropdown" />
        {t('diffBuild.lessDifferenceImages')}
      </Accordion.Title>
      <Accordion.Content>
        {listLessDiffImages(diffBuild).map(x => (
          <ImageDiff key={x.path} value={x} />
        ))}
      </Accordion.Content>
    </Accordion>
  </div>
;

const InOutImages = ({ diffBuild, t }: Props) =>
  <div className={style.myInOutImages}>
    <h2 className={style.myInOutImagesHeader}>
      <Icon name="exchange" /> {t('diffBuild.inOutImages')}
    </h2>
    {diffBuild.newImages && diffBuild.delImages ?
      <List>
        {diffBuild.newImages.map(x => (
          <List.Item key={`new${x.path}`} className={style.myInOutImagesItem}>
            <ModalImage image={<Image src={x.imagePath} />} />
            <List.Content><Icon name="plus" color="green" /> {x.path}</List.Content>
          </List.Item>
        ))}
        {diffBuild.delImages.map(x => (
          <List.Item key={`del${x.path}`} className={style.myInOutImagesItem}>
            <ModalImage image={<Image src={x.imagePath} />} />
            <List.Content><Icon name="minus" color="red" /> {x.path}</List.Content>
          </List.Item>
        ))}
      </List>
    : <div>{t('diffBuild.nothing')}</div>
    }
  </div>
;

const DiffBuildDetail = ({ diffBuild, t }: Props) => isLoaded(diffBuild) &&
  <div className={style.my}>
    <Headline diffBuild={diffBuild} t={t} />
    <Statistics diffBuild={diffBuild} t={t} />
    <DiffImages diffBuild={diffBuild} t={t} />
    <InOutImages diffBuild={diffBuild} t={t} />
  </div>
;

export default compose(
  translate(''),
  connect(({ diffBuild }) => ({ diffBuild })),
  setDocumentTitleWithAppName(({ t }: Props) => t('diffBuild.detail.title')),
)(DiffBuildDetail);
