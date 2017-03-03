// @flow
import React from 'react';
import { Grid, Image, Label, Icon } from 'semantic-ui-react';
import ModalImage from 'components/ModalImage';
import type { ImageDiff as ImageDiffType } from 'domains/DiffBuild';
import style from 'styles/components/ImageDiff.css';

type Props = {
  value: ImageDiffType
};

const ImageDiff = ({ value }: Props) =>
  <div className={style.my}>
    <h4 className={style.myTitle}>
      <Label className={style.myPercent} size="large" pointing="below">
        <Icon name="edit" />
        {`${value.percentage} %`}
      </Label>
      {value.path}
    </h4>
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column>
          <ModalImage
            image={
              <Image
                src={value.diffImagePath}
                alt=""
                bordered
                style={{
                  backgroundImage: `url(${value.expectImagePath})`,
                  backgroundPosition: 'center top',
                  backgroundSize: '100% auto',
                }}
              />
            }
          />
        </Grid.Column>
        <Grid.Column>
          <ModalImage
            image={<Image src={value.actualImagePath} alt="" bordered />}
          />
        </Grid.Column>
        <Grid.Column>
          <ModalImage
            image={<Image src={value.expectImagePath} alt="" bordered />}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
;

export default ImageDiff;
