// @flow
import React from 'react';

type Props = {
  username: string,
  reponame: string,
  buildNum: number | string,
  children?: any,
};

const CircleBuildLink = ({ username, reponame, buildNum, children }: Props) =>
  <a
    href={`https://circleci.com/gh/${username}/${reponame}/${buildNum}`}
    target="self"
  >{ children }</a>
;

export default CircleBuildLink;
