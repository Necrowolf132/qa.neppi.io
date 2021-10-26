import { useContext } from 'react';
import EditViewDataManagerContext from 'strapi-plugin-content-manager/admin/src/contexts/EditViewDataManager';

const useDataManager = () => {
  return useContext(EditViewDataManagerContext);
};

export default useDataManager;
