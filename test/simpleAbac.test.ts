'use strict';
import { SimpleAbac } from '../lib/index';

describe('SimpleAbac module', () => {
  const simpleAbac = new SimpleAbac();

  simpleAbac.allow({
    role: 'all',
    actions: 'read',
    targets: 'post',
    attributes: { mode: 'all', except: ['authorId']},
  });

  simpleAbac.allow({
    role: 'admin',
    actions: 'read',
    targets: 'post',
    attributes: { mode: 'all' },
  });

  simpleAbac.allow({
    role: 'admin',
    actions: 'create',
    targets: 'post',
    attributes: { mode: 'all' },
  });


  it('should give permission to read posts to anyone', async () => {
    const permission = await simpleAbac.can(undefined, 'read', 'post', {});
    expect(permission.granted).toBe(true);
  });

  it('should give permission to read posts to admin', async () => {
    const permission = await simpleAbac.can({ role: 'admin' }, 'read', 'post', {});
    expect(permission.granted).toBe(true);
  });

  it('should let anyone to read everything of a post except authorId', async () => {
    const postAttributes = {authorId: 1, id: 2, content: "a"};
    const permission = await simpleAbac.can(undefined, 'read', 'post', postAttributes);
    expect(permission.filter(postAttributes)).toEqual({id: 2, content: "a"});
  });

  it('should let admin to read everything of a post', async () => {
    const postAttributes = {authorId: 1, id: 2, content: "a"};
    const permission = await simpleAbac.can({ role: 'admin' }, 'read', 'post', postAttributes);
    expect(permission.filter(postAttributes)).toEqual(postAttributes);
  });

  it('should deny permission to create posts to undefined', async () => {
    const permission = await simpleAbac.can(undefined, 'create', 'post', {});
    expect(permission.granted).toBe(false);
  });
  
  it('should give permission to create posts to admin', async () => {
    const permission = await simpleAbac.can({ role: 'admin' }, 'create', 'post', {});
    expect(permission.granted).toBe(true);
  });
});