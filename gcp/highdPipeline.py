import argparse
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
from apache_beam.io.gcp.bigquery import WriteToBigQuery
from apache_beam.io import ReadFromText

class ParseCSV(beam.DoFn):
    def process(self, element):
        # Split the CSV row and convert it to a dictionary using the column names from the new CSV file
        columns = ['id', 'width', 'height', 'initialFrame', 'finalFrame', 'numFrames', 'class', 'drivingDirection', 'traveledDistance', 'minXVelocity', 'maxXVelocity', 'meanXVelocity', 'minDHW', 'minTHW', 'minTTC', 'numLaneChanges']
        values = element.split(',')
        row = dict(zip(columns, values))
        
        # Convert numeric fields from strings to appropriate types
        for col in ['width', 'height', 'initialFrame', 'finalFrame', 'numFrames', 'traveledDistance', 'minXVelocity', 'maxXVelocity', 'meanXVelocity', 'minDHW', 'minTHW', 'minTTC', 'numLaneChanges']:
            row[col] = float(row[col]) if '.' in row[col] else int(row[col])
        
        return [row]

def run(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', dest='input', required=True, help='Input file to read. This can be a local file or a file in a Google Cloud Storage bucket.')
    parser.add_argument('--output', dest='output', required=True, help='Output BigQuery table to write results to. It should be in the format of "dataset.table".')

    known_args, pipeline_args = parser.parse_known_args(argv)

    p = beam.Pipeline(options=PipelineOptions(pipeline_args))

    (p
     | 'ReadCSVFile' >> ReadFromText(known_args.input, skip_header_lines=1)
     | 'ParseCSVRows' >> beam.ParDo(ParseCSV())
     | 'FilterLaneChanges' >> beam.Filter(lambda x: x['numLaneChanges'] > 0)
     | 'WriteToBigQuery' >> WriteToBigQuery(
            known_args.output,
            schema = "ID:INTEGER,width:FLOAT,height:FLOAT,initialFrame:INTEGER,finalFrame:INTEGER,numFrames:INTEGER,class:STRING,drivingDirection:INTEGER,traveledDistance:FLOAT,minXVelocity:FLOAT,maxXVelocity:FLOAT,meanXVelocity:FLOAT, MINDHW:FLOAT,minTHW:FLOAT,minTTC:FLOAT,numLaneChanges:INTEGER", 
            create_disposition=beam.io.BigQueryDisposition.CREATE_IF_NEEDED,
            write_disposition=beam.io.BigQueryDisposition.WRITE_TRUNCATE)
    )

    result = p.run()
    result.wait_until_finish()

if __name__ == '__main__':
    run()