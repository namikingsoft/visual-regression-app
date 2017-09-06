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
  Item,
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
import ModalImage from 'components/ModalImage';
import { setDocumentTitleWithAppName } from 'highorders/setDocumentTitle';
import type { Dispatch } from 'actions';
import type { DiffBuild, ImageDiff } from 'domains/DiffBuild';
import style from 'styles/pages/DiffBuildDetail.css';

type TProps = {
  t: TFunction,
};
type NoDispatchProps = {
  diffBuild: DiffBuild,
  t: TFunction,
};
type Props = NoDispatchProps & {
  dispatch: Dispatch,
};

const Headline = ({ diffBuild, t }: NoDispatchProps) => (isSuccess(diffBuild) ?
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

const Statistics = ({ diffBuild, t }: NoDispatchProps) =>
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

const DiffImage = ({ image, dispatch }: { image: ImageDiff, dispatch: Dispatch }) =>
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
          <Image
            src={image.diffImagePath}
            alt=""
            bordered
            onClick={() => dispatch({
              type: 'Lightbox/OPEN',
              images: [
                image.diffImagePath,
                image.actualImagePath,
                image.expectImagePath,
              ],
              index: 0,
            })}
          />
        </Grid.Column>
        <Grid.Column>
          <Image
            src={image.actualImagePath}
            alt=""
            bordered
            onClick={() => dispatch({
              type: 'Lightbox/OPEN',
              images: [
                image.diffImagePath,
                image.actualImagePath,
                image.expectImagePath,
              ],
              index: 1,
            })}
          />
        </Grid.Column>
        <Grid.Column>
          <Image
            src={image.expectImagePath}
            alt=""
            bordered
            onClick={() => dispatch({
              type: 'Lightbox/OPEN',
              images: [
                image.diffImagePath,
                image.actualImagePath,
                image.expectImagePath,
              ],
              index: 2,
            })}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
;

const DiffImagesHeader = ({ t }: TProps) =>
  <Grid className={style.myDiffImagesHeader}>
    <Grid.Row columns={3}>
      <Grid.Column>
        <h2><Icon name="picture" /> {t('diffBuild.differenceImages')}</h2>
      </Grid.Column>
      <Grid.Column>
        <h3>{t('diffBuild.actual')}</h3>
      </Grid.Column>
      <Grid.Column>
        <h3>{t('diffBuild.expect')}</h3>
      </Grid.Column>
    </Grid.Row>
  </Grid>
;

const DiffImages = ({ diffBuild, dispatch, t }: Props) =>
  <div className={style.myDiffImages}>
    <DiffImagesHeader t={t} />
    {listManyDiffImages(diffBuild).map(x => (
      <DiffImage key={x.path} image={x} dispatch={dispatch} />
    ))}
    <Accordion className={style.myDiffImagesLesses}>
      <Accordion.Title>
        <Icon name="dropdown" />
        {t('diffBuild.lessDifferenceImages')}
      </Accordion.Title>
      <Accordion.Content>
        {listLessDiffImages(diffBuild).map(x => (
          <DiffImage key={x.path} image={x} dispatch={dispatch} />
        ))}
      </Accordion.Content>
    </Accordion>
  </div>
;

const InOutImages = ({ diffBuild, t }: NoDispatchProps) => (
  diffBuild.newImages.length > 0 || diffBuild.delImages.length > 0 ?
    <div className={style.myInOutImages}>
      <h2 className={style.myInOutImagesHeader}>
        <Icon name="exchange" /> {t('diffBuild.inOutImages')}
      </h2>
      <Item.Group divided>
        {diffBuild.newImages.map(x => (
          <Item key={`new${x.path}`}>
            <ModalImage image={<Item.Image src={x.imagePath} />} />
            <Item.Content verticalAlign="middle">
              <Item.Header style={{ fontWeight: 'normal' }}>
                <Icon name="plus" color="green" size="huge" /> {x.path}
              </Item.Header>
            </Item.Content>
          </Item>
        ))}
        {diffBuild.delImages.map(x => (
          <Item key={`del${x.path}`}>
            <ModalImage image={<Item.Image src={x.imagePath} />} />
            <Item.Content verticalAlign="middle">
              <Item.Header style={{ fontWeight: 'normal' }}>
                <Icon name="delete" color="red" size="huge" /> {x.path}
              </Item.Header>
            </Item.Content>
          </Item>
        ))}
      </Item.Group>
    </div>
  : null
);

const DiffBuildDetail = ({ dispatch, ...props }: Props) =>
  isLoaded(props.diffBuild) &&
  <div className={style.my}>
    <Headline {...props} />
    <Statistics {...props} />
    <DiffImages {...props} dispatch={dispatch} />
    <InOutImages {...props} />
  </div>
;

export default compose(
  translate(''),
  connect(({ diffBuild }) => ({ diffBuild })),
  setDocumentTitleWithAppName(({ t }: Props) => t('diffBuild.detail.title')),
)(DiffBuildDetail);
