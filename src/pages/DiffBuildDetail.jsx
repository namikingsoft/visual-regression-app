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
  Label,
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
import type { DiffBuild, ImageDiff } from 'domains/DiffBuild';
import ModalImage from 'components/ModalImage';
import CircleBuildLink from 'components/CircleBuildLink';
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

const DiffImage = ({ image }: { image: ImageDiff }) =>
  <div className={style.myDiffImage}>
    <h4 className={style.myDiffImageTitle}>
      <Label className={style.myDiffImagePercent} size="large" pointing="below">
        <Icon name="edit" />
        {`${image.percentage} %`}
      </Label>
      {image.path}
    </h4>
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column>
          <ModalImage
            image={
              <Image
                src={image.diffImagePath}
                alt=""
                bordered
                style={{
                  backgroundImage: `url(${image.expectImagePath})`,
                  backgroundPosition: 'center top',
                  backgroundSize: '100% auto',
                }}
              />
            }
          />
        </Grid.Column>
        <Grid.Column>
          <ModalImage
            image={<Image src={image.actualImagePath} alt="" bordered />}
          />
        </Grid.Column>
        <Grid.Column>
          <ModalImage
            image={<Image src={image.expectImagePath} alt="" bordered />}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
;

const DiffImagesHeader = ({ diffBuild, t }: Props) =>
  <Grid className={style.myDiffImagesHeader}>
    <Grid.Row columns={3}>
      <Grid.Column>
        <h2><Icon name="picture" /> {t('diffBuild.differenceImages')}</h2>
      </Grid.Column>
      <Grid.Column>
        <h3>
          {t('diffBuild.actual')}&nbsp;
          <CircleBuildLink
            username={diffBuild.username}
            reponame={diffBuild.reponame}
            buildNum={diffBuild.actualBuildNum}
          >{`#${diffBuild.actualBuildNum}`}</CircleBuildLink>
        </h3>
      </Grid.Column>
      <Grid.Column>
        <h3>
          {t('diffBuild.expect')}&nbsp;
          <CircleBuildLink
            username={diffBuild.username}
            reponame={diffBuild.reponame}
            buildNum={diffBuild.expectBuildNum}
          >{`#${diffBuild.expectBuildNum}`}</CircleBuildLink>
        </h3>
      </Grid.Column>
    </Grid.Row>
  </Grid>
;

const DiffImages = ({ diffBuild, t }: Props) =>
  <div className={style.myDiffImages}>
    <DiffImagesHeader diffBuild={diffBuild} t={t} />
    {listManyDiffImages(diffBuild).map(x => (
      <DiffImage key={x.path} image={x} />
    ))}
    <Accordion className={style.myDiffImagesLesses}>
      <Accordion.Title>
        <Icon name="dropdown" />
        {t('diffBuild.lessDifferenceImages')}
      </Accordion.Title>
      <Accordion.Content>
        {listLessDiffImages(diffBuild).map(x => (
          <DiffImage key={x.path} image={x} />
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
            <List.Content>
              <Icon name="plus" color="green" size="large" /> {x.path}
            </List.Content>
          </List.Item>
        ))}
        {diffBuild.delImages.map(x => (
          <List.Item key={`del${x.path}`} className={style.myInOutImagesItem}>
            <ModalImage image={<Image src={x.imagePath} />} />
            <List.Content>
              <Icon name="minus" color="red" size="large" /> {x.path}
            </List.Content>
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
