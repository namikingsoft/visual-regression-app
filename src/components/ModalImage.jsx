// @flow
import React from 'react';
import { Modal } from 'semantic-ui-react';

type Props = {
  image: React$Element<*>,
};

const ModalImage = ({ image }: Props) =>
  <Modal
    trigger={image}
    size="large"
    dimmer="blurring"
    basic
  >
    <Modal.Content>{image}</Modal.Content>
  </Modal>
;

export default ModalImage;
