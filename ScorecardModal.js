

import React, { Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import * as projectRequestPartThreeService from "../../services/projectRequestPartThree.service"


class ScorecardModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            eventId: '',
            show: false,
            proposalData: '',
        }
        this.showModal = this.showModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.clickHandlerModal = this.clickHandlerModal.bind(this)
    }

    showModal(event) {
        this.setState({
            show: true
        })
    }

    closeModal = (event) => {
        this.setState({
            show: false
        })
    }

    clickHandlerModal(proposalId) {
        
        projectRequestPartThreeService.populateScorecard(proposalId)
        .then(result => {
            this.setState({
                proposalData: result
            })
        })
        this.showModal();

        
    }


    render() {
        //turn f1 into an object, have display name properties and field names
        const F1s = [
        {
            dataName:'lastName',
            displayName: 'Board member'
        },
        {
            dataName: 'perceivedSuccess',
            displayName: 'F1'
        },
        {
            dataName:'perceivedScalability',
            displayName:'F2'
        },
        {
            dataName:'valueStrategies',
            displayName: 'F3'
        }];
        const scorecardSummary = this.state.proposalData ? (
            F1s.map((f1, index) => {
                let sums = 0;
                    const rowOfTds = this.state.proposalData.map(data => ( 
                        (isNaN(parseInt(data[f1.dataName]))) ? null : sums += parseInt(data[f1.dataName]),
                        <td>{data[f1.dataName]}</td>
                            ))
                if (sums){
                    rowOfTds.push(<td>{sums}</td>)
                } 
                else {
                    rowOfTds.push(<td>Summed total</td>);
                }
            rowOfTds.unshift(<td>{f1.displayName}</td>);
         return <tr>{rowOfTds}</tr>
        }
          )) : (
              <React.Fragment />
            );

            const dataKey = [
                {
                    displayName: 'Board Member'
                },
                {
                    value: 1,
                    displayName: 'Greatest Benefit'
                },
                {
                    value: 2,
                    displayName: 'Strategic Alignment'
                },
                {
                    value: 3,
                    displayName: 'Resource Availability'
                },
                {
                    value: 4,
                    displayName: 'Technical Difficulty'
                }]
                const valueSummary = this.state.proposalData ? (
                    dataKey.map((values, index) => {
                        let sums = 0;
                            const newRowOfTds = this.state.proposalData.map((data) => { 
                                if (index == 0) {
                                    return <td>{data.lastName}</td>
                                } else if (data.projectValue === values.value) {
                                    sums += 1;
                                    return <td>X</td>
                                } else if (data.projectValue !== values.value)  {
                                    return <td>  </td>
                                }
                            })
                                if (sums){
                                        newRowOfTds.push(<td>{sums}</td>)
                                    } 
                                    else if (sums == false && index==0) {
                                        newRowOfTds.push(<td>Summed Total </td>);
                                    } else {
                                        newRowOfTds.push(<td> </td>);
                                }
                            newRowOfTds.unshift(<td>{values.displayName}</td>);
                    return <tr>{newRowOfTds}</tr>
                }
                  )) : (
                      <React.Fragment />
                    );

        return (<React.Fragment>
            <span
                type="button"
                className="label label-success rounded"
                onClick={e => this.clickHandlerModal(this.props.proposalId)}> Scorecard
                
                {/* onClick={ e => this.clickHandlerModal(this.props, e)}> Scorecard */}
            </span>
            <Modal
                show={this.state.show}
                onHide={this.closeModal}
            >
                <div class="row">
                    <div class="col-md-12">
                        <div className="panel panel-theme rounded shadow">
                            <div className="panel-heading">
                                <div className="pull-left">
                                    <h3 className="panel-title">{this.props.modalEventId}</h3>
                                </div>
                                <div className="pull-right">
                                    <button className="btn btn-sm" data-action="remove" data-container="body" data-toggle="tooltip" data-placement="top" data-title="Remove" data-original-title="" title="" onClick={this.closeModal}><i className="fa fa-times"></i></button>
                                </div>
                                <div className="clearfix"></div>
                            </div>
                            <div className="panel-body">

                                <div className="row">
                                <div className="col-md-12">
                                <h4>Scorecard Summary</h4>
                                    <table class="table table-striped">
                                    <tbody class = "padding: 8px  box-sizing: border-box">
                                    {scorecardSummary}
                                </tbody>
                                </table>
                            </div>
                            </div>

                            <div className="row">
                            <div className="col-md-12">
                                <h4>Value Summary</h4>
                                <table class="table table-striped">
                                <tbody class = "padding: 8px  box-sizing: border-box">{valueSummary}</tbody>
                                </table>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
               
                <Modal.Footer>
                    {/* <div className="pull-left">
                    </div> */}
                    <button
                        type="button"
                        onClick={this.closeModal}
                        className="label label-success rounded btn-lg"
                    >Close
                    </button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>)
    }
}
export default ScorecardModal
