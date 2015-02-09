<?

  // handle raspberry-request

  $pin = $_GET['pin'];
  $start = $_GET['start'];
  $filename = 'led-duty.pt';

  echo exec('sudo ./../python/'.$filename.' '.$pin.' '.$start);

?>
