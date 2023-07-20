import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('data received %s', data, data.messageType);
    switch (data?.messageType) {
      case 'INITIATE_CALL':
        console.log(
          'sending CALL_STATE_UPDATE, PTT_STATE_UPDATE, CALLEE_STATE_UPDATE'
        );
        ws.send({
          messageType: 'CALL_STATE_UPDATE',
          callId: '343',
          callStateChange: 'ESTABLISHED',
          reason: 'dfdf',
        });
        ws.send({
          messageType: 'PTT_STATE_UPDATE',
          pttState: 'FREE',
        });
        if (this.callStateError === 'ALL_CALLEES_BUSY') {
          data.callees?.forEach((currentCallee) => {
            ws.send({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'BUSY',
              callee: {
                uid: currentCallee.uid,
                calleeType: currentCallee.calleeType,
              },
            });
          });
        } else if (this.callErrorState === 'USERS_UNAVAILABLE') {
          // the first callee is in IN_CALL state
          ws.send({
            messageType: 'CALLEE_STATE_UPDATE',
            callId: '343',
            calleeState: 'BUSY', //Record 1
            callee: {
              uid: data.callees[0].uid,
              calleeType: data.callees[0].calleeType,
            },
          });
          // the second callee is in OUT_OF_CALL state
          if (data.callees[1]) {
            ws.send({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'IN_CALL', //Record 2
              callee: {
                uid: data.callees[1].uid,
                calleeType: data.callees[1].calleeType,
              },
            });
          }
          // the third callee is in BUSY state
          if (data.callees[2]) {
            ws.send({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'NON_EXISTING', //record 3
              callee: {
                uid: data.callees[2].uid,
                calleeType: data.callees[2].calleeType,
              },
            });
          }
        } else {
          // the first callee is in IN_CALL state
          ws.send({
            messageType: 'CALLEE_STATE_UPDATE',
            callId: '343',
            calleeState: 'BUSY', // record 1
            callee: {
              uid: data.callees[0].uid,
              calleeType: data.callees[0].calleeType,
            },
          });
          // the second callee is in OUT_OF_CALL state
          if (data.callees[1]) {
            ws.send({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'IN_CALL', //Record 2
              callee: {
                uid: data.callees[1].uid,
                calleeType: data.callees[1].calleeType,
              },
            });
          }
          // the third callee is in BUSY state
          if (data.callees[2]) {
            ws.send({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'NON_EXISTING', //record 3
              callee: {
                uid: data.callees[2].uid,
                calleeType: data.callees[2].calleeType,
              },
            });
          }
          // the fourth callee is in OFFLINE state
          // if (data.callees[3]) {
          //   ws.send({
          //     messageType: 'CALLEE_STATE_UPDATE',
          //     callId: '343',
          //     calleeState: 'OFFLINE',
          //     callee: {
          //       uid: data.callees[3].uid,
          //       calleeType: data.callees[3].calleeType,
          //     },
          //   });
          // }
        }
        // this would be useful in PTT state updates
        this.callee = {
          uid: data.callees[0].uid,
          calleeType: data.callees[0].calleeType,
        };
        break;
      case 'INITIATE_EMERGENCY_CALL':
        console.log(
          'sending CALL_STATE_UPDATE, PTT_STATE_UPDATE, CALLEE_STATE_UPDATE'
        );
        ws.send({
          messageType: 'CALL_STATE_UPDATE',
          callId: '343',
          callStateChange: 'ESTABLISHED',
          reason: 'dfdf',
        });
        ws.send({
          messageType: 'CALLEE_STATE_UPDATE',
          callId: '343',
          calleeState: 'IN_CALL',
          callee: {
            uid: data.callee.uid,
            calleeType: data.callee.calleeType,
          },
        });
        this.callee = {
          uid: data.callee.uid,
          calleeType: data.callee.calleeType,
        };
        ws.send({
          messageType: 'PTT_STATE_UPDATE',
          // pttState: 'FREE',
          // pttState: 'ASSIGNED_THIS_USER',
          pttState: 'ASSIGNED_OTHER_USER',
          pttOwner: this.callee,
        });
        break;
      case 'REQUEST_PTT':
        if (this.pttAssignment.assignment !== 'currentUser') {
          console.log('sending PTT_STATE_UPDATE - ASSIGNED_OTHER_USER');
          ws.send({
            messageType: 'PTT_STATE_UPDATE',
            pttState: 'ASSIGNED_OTHER_USER',
            pttOwner: this.callee,
          });
        } else {
          console.log('sending PTT_STATE_UPDATE - ASSIGNED_THIS_USER');
          ws.send({
            messageType: 'PTT_STATE_UPDATE',
            pttState: 'ASSIGNED_THIS_USER',
          });
        }
        break;
      case 'RELEASE_PTT':
        console.log('sending PTT_STATE_UPDATE - FREE');
        ws.send({
          messageType: 'PTT_STATE_UPDATE',
          pttState: 'FREE',
        });
        break;
      case 'TERMINATE_CALL':
        console.log('CALL_STATE_UPDATE - TERMINATED');
        ws.send({
          messageType: 'CALL_STATE_UPDATE',
          callId: '343',
          callStateChange: 'TERMINATED',
          reason: 'dfdf',
        });
        break;
      case 'REGISTER':
        console.log('received register command');
        ws.send({
          messageType: 'REGISTRATION_STATE_UPDATE',
          registrationState: this.registerFail
            ? 'REGISTER_ERROR'
            : 'REGISTERED',
        });
        break;
    }
  });
});