export const getStudyHouseCode = () => {
  return new URLSearchParams(window.location.search).get('studyHouseCode') || '';
};