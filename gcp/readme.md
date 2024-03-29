Command to run the pipeline:

```
python highdPipeline.py \
--input $BUCKET/data/*_tracksMeta.csv \
--output $PROJECT:highd.Results \
--project $PROJECT \
--runner DataflowRunner \
--temp_location $BUCKET/temp \
--staging_location $BUCKET/staging \
--region northamerica-northeast2 \
--experiment use_unsupported_python_version
```
