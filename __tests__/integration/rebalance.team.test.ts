import request from 'supertest';
import app from '../../src/app';
import { getRoot } from '../../src/services/member.service';
import { importTeam } from './import.team.test';

describe('PUT /api/team', () => {
  /**
   * Rebalance with index = 1.
   *
   *                         0
   *        0                |
   *       / \               1
   *      1   2              |
   *    / | \  \   =>       ...
   *   3  4  5  8            |
   *     / \                 6
   *    6   7                |
   *                         7
   */
  it('should successfully rebalance the team structure by a given balance index = 1', async () => {});

  /**
   * Rebalance with index = 2.
   *
   *        0                0
   *       / \              / \
   *      1   2            1   2
   *    / | \  \   =>     / \   \
   *   3  4  5  8        3   4   8
   *     / \            /   / \
   *    6   7          5   6   7
   */
  it('should successfully rebalance the team structure by a given balance index = 2', async () => {});

  /**
   * Rebalance with index = 3.
   *
   *          0                 0
   *       / | | \            / |  \
   *      /  | |  \     =>   1  2   3
   *     1   2 3   4        /|\  \  |\
   *    /|\  | |\   \      5 6 4  8 9 10
   *   5 6 7 8 9 10 11         /\
   *                          11 7
   */
  it('should successfully rebalance the team structure by a given balance index = 3', async () => {});

  it('should return a validation for a given balance index = 0', async () => {});
  it('should return a validation for a given balance index < 0', async () => {});
});
