/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from 'vitest';
import App from '../../App';
import Node from './node';

// cyclic imports fix
// eslint-disable-next-line no-unused-vars
const _dont_delete_me = App;

function makeNode(labels?: Record<string, string>) {
  return new Node({
    apiVersion: 'v1',
    kind: 'Node',
    metadata: { name: 'node-1', uid: 'uid', creationTimestamp: '', labels },
    spec: {},
    status: {},
  } as any);
}

describe('Node.getRoles', () => {
  it('has no roles without labels', () => {
    expect(makeNode().getRoles()).toEqual([]);
    expect(makeNode({ 'kubernetes.io/os': 'linux' }).getRoles()).toEqual([]);
  });

  it('reads the role from the node-role.kubernetes.io/<role> label name', () => {
    expect(
      makeNode({
        'node-role.kubernetes.io/worker': '',
        'node-role.kubernetes.io/control-plane': '',
      }).getRoles()
    ).toEqual(['control-plane', 'worker']);
  });

  it('reads the role from the value of the kubernetes.io/role label', () => {
    expect(makeNode({ 'kubernetes.io/role': 'node' }).getRoles()).toEqual(['node']);
  });

  it('lists a role once when both labels name it', () => {
    expect(
      makeNode({
        'kubernetes.io/role': 'master',
        'node-role.kubernetes.io/master': '',
      }).getRoles()
    ).toEqual(['master']);
  });

  it('ignores empty role names', () => {
    expect(
      makeNode({ 'kubernetes.io/role': '', 'node-role.kubernetes.io/': '' }).getRoles()
    ).toEqual([]);
  });
});
