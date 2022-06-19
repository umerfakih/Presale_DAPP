import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import Navbar from './Navbar'
import CrowdsaleAbi from './contracts/presale.json'
function App() {
  let myStyle = {
    color: 'white',
    backgroundColor: '#042743',
    
  }

  const [refresh, setrefresh] = useState(0)

  let content
  const [loading2, setloading2] = useState(false)

  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [TokenSoldInPresale, setTokenSoldInPresale] = useState(0)
  const [TokenPriceInPresale, setTokenPriceInPresale] = useState(0)
  const [inputfieldchange, setinputfieldchange] = useState(0)
  const [presalecontractinstance, setpresalecontractinstance] = useState({})
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      )
    }
  }

  const loadBlockchainData = async () => {
    setLoading(true)
    if (typeof window.ethereum == 'undefined') {
      return
    }
    const web3 = new Web3(window.ethereum)

    const accounts = await web3.eth.getAccounts()

    if (accounts.length === 0) {
      return
    }
    setAccount(accounts[0])
    const networkId = await web3.eth.net.getId()
    if (networkId === 3) {


      const presalecontract = new web3.eth.Contract(
        CrowdsaleAbi.abi,
        '0x348B4Ebd7dBef671881F5828fAfa7344e3BD3Fa1',
      )
      setpresalecontractinstance(presalecontract)

      const tokenpriceofpresale = await presalecontract.methods
        .tokenprice()
        .call()

      const totalsoldofpresale = await presalecontract.methods
        .totalsold()
        .call()
      const totalsoldofpresaleinether = await web3.utils.fromWei(
        totalsoldofpresale,
        'ether',
      )

      setTokenSoldInPresale(totalsoldofpresaleinether)
      setTokenPriceInPresale(tokenpriceofpresale)
      setLoading(false)
    } else {
      window.alert('the contract not deployed to detected network.')
      setloading2(true)
    }
  }

  const changeininputfield = (e) => {
    console.log(e.target.value)
    setinputfieldchange(e.target.value)
  }

  const onsubmit = async () => {
    console.log(parseFloat(inputfieldchange))
    if (parseFloat(inputfieldchange) > 0) {
      await onsendbuytransaction(inputfieldchange)
    } else {
      window.alert('null value not allowed')
    }
  }

  const onsendbuytransaction = async (a) => {
    const web3 = new Web3(window.ethereum)

    const amountofethinwei = await web3.utils.toWei(a.toString())

    await presalecontractinstance.methods
      .buyTokens()
      .send({ from: account, value: amountofethinwei })
      .once('recepient', (recepient) => {
        window.alert('sucess')
      })
      .on('error', () => {
        window.alert('error ')
      })

  }

  const walletAddress = async () => {
    await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [
        {
          eth_accounts: {},
        },
      ],
    })
    window.location.reload()
  }

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()

    if (refresh === 1) {
      setrefresh(0)
      loadBlockchainData()
    }
    //esl
  }, [refresh])

  if (loading === true) {
    content = (
      <p className="text-center">
        Loading...{loading2 ? <div>loading....</div> : ''}
      </p>
    )
  } else {
    content = (
      <div className="container my-4">
        <h2 className=""> Presale</h2>
        <div className="row">
          <div className="col-md-4">
            <div class="card" style={{ width: '18rem', myStyle }}>
              {/* <img src={""} class="card-img-top" alt="..." /> */}
              <div class="card-body" style={myStyle}>
                <h5 class="card-title">Mytoken </h5>
                <p class="card-text">MKT</p>
                <p class="caard-text">Total raise 10 Million Tokens </p>
                <p> TokenPriceInPresale : {TokenPriceInPresale} ether</p>
                <form>
                  <div className="form-group">
                    <input
                      placeholder="input the eth amount"
                      value={inputfieldchange}
                      onChange={changeininputfield}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={onsubmit}>
                    Buy TOken
                  </button>
                </form>
                <p> TokenSoldInPresale : {TokenSoldInPresale}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar account={account} />

      {account === '' ? (
        <div className="container">
          {' '}
          Connect your wallet to application{'   '}{' '}
          <button onClick={walletAddress}>metamask</button>
        </div>
      ) : (
        content
      )}
      {/* {content} */}
    </div>
  )
}

export default App
