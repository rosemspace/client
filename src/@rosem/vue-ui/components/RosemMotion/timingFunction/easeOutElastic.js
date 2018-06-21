import easeInElastic from "./easeInElastic";

export default (
  timeFraction /*, {amplitude = 1, frequency = 4, decay = 5} = {}*/
) => 1 - easeInElastic(1 - timeFraction /*, {amplitude, frequency, decay}*/);
