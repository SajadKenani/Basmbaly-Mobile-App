export const SET_EMPLOYEE_NAME = 'SET_EMPLOYEE_NAME';
export const SET_EMPLOYEE_PHONE = 'SET_EMPLOYEE_PHONE';
export const SET_EMPLOYEE_TITLE = 'SET_EMPLOYEE_TITLE';

export const SET_EMPLOYEE_SALARY = 'SET_EMPLOYEE_SALARY';

export const SET_EMPLOYEE_DELAY_HOURS = 'SET_EMPLOYEE_DELAY_HOURS';
export const SET_EMPLOYEE_DELAY_MINUTES = 'SET_EMPLOYEE_DELAY_MINUTES';

export const SET_EMPLOYEE_DISCOUNT = 'SET_EMPLOYEE_DISCOUNT';

export const SET_EMPLOYEE_PASSWORD = 'SET_EMPLOYEE_PASSWORD';

export const SET_EMPLOYEE_SELECTED = 'SET_EMPLOYEE_SELECTED';


export const SET_EMPLOYEE_BARCODE = 'SET_EMPLOYEE_BARCODE';

export const SET_EMPLOYEE_START = 'SET_EMPLOYEE_START';

export const SET_EMPLOYEE_GROUPID = 'SET_EMPLOYEE_GROUPID';




export const setEmployeeName = (name) => ({
  type: SET_EMPLOYEE_NAME,
  payload: name,
});

export const setEmployeePhone = (phone) => ({
  type: SET_EMPLOYEE_PHONE,
  payload: phone,
});

export const setEmployeeTitle = (title) => ({
  type: SET_EMPLOYEE_TITLE,
  payload: title,
});

export const setEmployeeSalary = (salary) => ({
    type: SET_EMPLOYEE_SALARY,
    payload: salary,
  });
  
  // export const setEmployeeDurationHours = (delayhours) => ({
  //   type: SET_EMPLOYEE_DELAY_HOURS,
  //   payload: delayhours,
  // });

  // export const setEmployeeDurationMinutes = (delayminutes) => ({
  //   type: SET_EMPLOYEE_DELAY_MINUTES,
  //   payload: delayminutes,
  // });

  export const setEmployeeDiscount = (discount) => ({
    type: SET_EMPLOYEE_DISCOUNT,
    payload: discount,
  });

  
  export const setEmployeePassword = (password) => ({
    type: SET_EMPLOYEE_PASSWORD,
    payload: password,
  });
    
  export const setEmployeeBarcode = (barcode) => ({
    type: SET_EMPLOYEE_BARCODE,
    payload: barcode,
  });

      
  export const setSelectedEmployee = (selected) => ({
    type: SET_EMPLOYEE_SELECTED,
    payload: selected,
  });

  export const setStartEmployee = (start) => ({
    type: SET_EMPLOYEE_START,
    payload: start,
  });

  
  export const setEmployeeGroupId = (groupId) => ({
    type: SET_EMPLOYEE_GROUPID,
    payload: groupId,
  });


