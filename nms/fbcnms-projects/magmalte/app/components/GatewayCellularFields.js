/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {GatewayV1} from './GatewayUtils';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import FormField from './FormField';
import Input from '@material-ui/core/Input';
import MagmaV1API from '@fbcnms/magma-api/client/WebClient';
import MenuItem from '@material-ui/core/MenuItem';
import React, {useState} from 'react';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

import nullthrows from '@fbcnms/util/nullthrows';
import {makeStyles} from '@material-ui/styles';
import {toString} from './GatewayUtils';
import {useRouter} from '@fbcnms/ui/hooks';

const useStyles = makeStyles({
  input: {
    margin: '10px 0',
    width: '100%',
  },
  title: {
    fontSize: '15px',
  },
  divider: {
    margin: '10px 0',
  },
});

type Props = {
  onClose: () => void,
  onSave: (gatewayID: string) => void,
  gateway: GatewayV1,
};

export default function GatewayCellularFields(props: Props) {
  const classes = useStyles();
  const {match} = useRouter();

  const [natEnabled, setNatEnabled] = useState<boolean>(
    props.gateway.epc.natEnabled,
  );
  const [ipBlock, setIpBlock] = useState<string>(props.gateway.epc.ipBlock);
  const [attachedEnodebSerials, setAttachedEnodebSerials] = useState<string[]>(
    props.gateway.attachedEnodebSerials,
  );
  const [pci, setPci] = useState<string>(toString(props.gateway.ran.pci));
  const [transmitEnabled, setTransmitEnabled] = useState<boolean>(
    props.gateway.ran.transmitEnabled,
  );
  const [nonEPSServiceControl, setNonEPSServiceControl] = useState<number>(
    props.gateway.nonEPSService.control,
  );
  const [csfbRAT, setCsfbRAT] = useState<number>(
    props.gateway.nonEPSService.csfbRAT,
  );
  const [mcc, setMcc] = useState<string>(
    toString(props.gateway.nonEPSService.csfbMCC),
  );
  const [mnc, setMnc] = useState<string>(
    toString(props.gateway.nonEPSService.csfbMNC),
  );
  const [lac, setLac] = useState<string>(
    toString(props.gateway.nonEPSService.lac),
  );

  const onSave = () => {
    const id = props.gateway.logicalID;
    const {cellular} = props.gateway.rawGateway;

    // these conditions should never be true since these values are coming from
    // a selector, but they're needed for Flow
    if (
      nonEPSServiceControl !== 0 &&
      nonEPSServiceControl !== 1 &&
      nonEPSServiceControl !== 2
    ) {
      return;
    }

    if (csfbRAT !== 1 && csfbRAT !== 0) {
      return;
    }

    const config = {
      ...cellular,
      epc: {
        ...cellular.epc,
        nat_enabled: natEnabled,
        ip_block: ipBlock,
      },
      ran: {
        ...cellular.ran,
        pci: parseInt(pci),
        transmit_enabled: transmitEnabled,
      },
      non_eps_service: {
        ...cellular.non_eps_service,
        non_eps_service_control: nonEPSServiceControl,
        csfb_rat: csfbRAT,
        csfb_mcc: mcc,
        csfb_mnc: mnc,
        lac: parseInt(lac),
      },
      // Override the registered eNodeB devices with new values
      attached_enodeb_serials: attachedEnodebSerials,
    };

    MagmaV1API.putLteByNetworkIdGatewaysByGatewayIdCellular({
      networkId: nullthrows(match.params.networkId),
      gatewayId: id,
      config,
    }).then(() => props.onSave(id));
  };

  const nonEPSServiceControlOff = nonEPSServiceControl == 0;
  return (
    <>
      <DialogContent>
        <Typography className={classes.title} variant="h6">
          EPC Configs
        </Typography>
        <FormField label="NAT Enabled">
          <Select
            className={classes.input}
            value={natEnabled ? 1 : 0}
            onChange={({target}) => setNatEnabled(!!target.value)}>
            <MenuItem value={1}>Enabled</MenuItem>
            <MenuItem value={0}>Disabled</MenuItem>
          </Select>
        </FormField>
        <FormField label="IP Block">
          <Input
            className={classes.input}
            value={ipBlock}
            onChange={({target}) => setIpBlock(target.value)}
            placeholder="E.g. 20.20.20.0/24"
            disabled={natEnabled}
          />
        </FormField>
        <Divider className={classes.divider} />
        <Typography className={classes.title} variant="h6">
          RAN Configs
        </Typography>
        <FormField label="Registered eNB IDs">
          <Input
            className={classes.input}
            value={attachedEnodebSerials.toString()}
            onChange={({target}) =>
              setAttachedEnodebSerials(target.value.replace(' ', '').split(','))
            }
            placeholder="E.g. 123, 456"
          />
        </FormField>
        <FormField label="PCI">
          <Input
            className={classes.input}
            value={pci}
            onChange={({target}) => setPci(target.value)}
            placeholder="E.g. 123"
          />
        </FormField>
        <FormField label="ENODEB Transmit Enabled">
          <Select
            className={classes.input}
            value={transmitEnabled ? 1 : 0}
            onChange={({target}) => setTransmitEnabled(!!target.value)}>
            <MenuItem value={1}>Enabled</MenuItem>
            <MenuItem value={0}>Disabled</MenuItem>
          </Select>
        </FormField>
        <Divider className={classes.divider} />
        <Typography className={classes.title} variant="h6">
          NonEPS Configs
        </Typography>
        <FormField label="NonEPS Service Control">
          <Select
            className={classes.input}
            value={nonEPSServiceControl}
            onChange={({target}) =>
              setNonEPSServiceControl(parseInt(target.value))
            }>
            <MenuItem value={0}>Off</MenuItem>
            <MenuItem value={1}>CSFB SMS</MenuItem>
            <MenuItem value={2}>SMS</MenuItem>
          </Select>
        </FormField>
        <FormField label="CSFB RAT Type">
          <Select
            disabled={nonEPSServiceControlOff}
            className={classes.input}
            value={csfbRAT}
            onChange={({target}) => setCsfbRAT(parseInt(target.value))}>
            <MenuItem value={0}>2G</MenuItem>
            <MenuItem value={1}>3G</MenuItem>
          </Select>
        </FormField>
        <FormField label="CSFB MCC">
          <Input
            disabled={nonEPSServiceControlOff}
            className={classes.input}
            value={mcc}
            onChange={({target}) => setMcc(target.value)}
            placeholder="E.g. 01"
          />
        </FormField>
        <FormField label="CSFB MNC">
          <Input
            disabled={nonEPSServiceControlOff}
            className={classes.input}
            value={mnc}
            onChange={({target}) => setMnc(target.value)}
            placeholder="E.g. 01"
          />
        </FormField>
        <FormField label="LAC">
          <Input
            disabled={nonEPSServiceControlOff}
            className={classes.input}
            value={lac}
            onChange={({target}) => setLac(target.value)}
            placeholder="E.g. 01"
          />
        </FormField>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </>
  );
}
