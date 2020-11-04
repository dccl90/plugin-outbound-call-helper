import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'OutboundCallHelperPlugin';

export default class OutboundCallHelperPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);
    flex.Actions.addListener("afterAcceptTask", (payload) => {
      if(payload.task.attributes.direction === "outbound") {
        let { attributes } = payload.task;
        let conferenceObj = {}
        let participantsObj = {}
        

        const fetchConference = () => {
            const fetchDelay = 3000;
            setTimeout(() => {

              const conference = payload.task.conference;

              // Add event listener to sync map
              conference.source.map.on("itemAdded", data => {

                // Fetch conference SID and participants from conference object
                const {conferenceSid, participants} = payload.task.conference;
                conferenceObj.sid = conferenceSid;
                
                // Iterate over participants and assign worker and customer call SIDs to the participants object
                participants.forEach(participant => {
                  if(participant.workerSid !== null) {
                    participantsObj.worker_call_sid = participant.callSid;
                  } else {
                    participantsObj.customer_call_sid = participant.callSid
                  }
                })

                // Update the task attributes
                conferenceObj.participants = participantsObj;
                attributes.conference = conferenceObj;
                payload.task.setAttributes(attributes)

              })
            }, fetchDelay);
        }

        fetchConference();
      }
    })
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }
  }
}
