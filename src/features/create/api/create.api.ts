import { createMission } from '../../missions/api/mission.api';
import { Mission, MissionInput } from '../../missions/model/mission.types';

export const submitMission = async (
  payload: MissionInput,
  ownerDeviceId: string,
): Promise<Mission> => {
  return createMission(payload, ownerDeviceId);
};
